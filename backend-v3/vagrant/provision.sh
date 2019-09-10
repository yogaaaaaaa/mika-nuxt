#!/bin/bash

echo "backend-v3 development - Centos provisioning"

cd /

# Installing epel and common depedency
yum -y update
yum -y install nano unzip epel-release gcc gcc-c++ make
yum -y update

# mariadb repo herdocs
cat <<-MARIADBREPO > /etc/yum.repos.d/MariaDB.repo
	[mariadb]
	name = MariaDB
	baseurl = http://yum.mariadb.org/10.4/centos7-amd64
	gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
	gpgcheck=1
MARIADBREPO

# arangodb repo
cd /etc/yum.repos.d/
curl -s -OL https://download.arangodb.com/arangodb34/RPM/arangodb.repo

# nodesource repo
curl -sL https://rpm.nodesource.com/setup_10.x | bash -

# yumi repo
yum -y install https://rpms.remirepo.net/enterprise/remi-release-7.rpm

# Installation of mariadb, nodejs and redis
yum -y update
yum -y install nodejs MariaDB-server MariaDB-client arangodb3-3.4.7-1.0
yum -y --enablerepo=remi install redis

## Configuring and enabling redis
sed -i 's/bind 127.0.0.1/#bind 127.0.0.1/' /etc/redis.conf
sed -i 's/protected-mode yes/protected-mode no/' /etc/redis.conf
systemctl enable redis
systemctl start redis

## Configure and enabling mariadb
sed -i 's/#bind-address=0.0.0.0/bind-address=0.0.0.0/' /etc/my.cnf.d/server.cnf
systemctl enable mariadb
systemctl start mariadb
mysql <<-MARIADBUSERQUERY
	CREATE USER 'mikadev'@'localhost' IDENTIFIED BY 'mikadev';
	CREATE USER 'mikadev'@'%' IDENTIFIED BY 'mikadev';
	GRANT ALL ON *.* TO 'mikadev'@'localhost';
	GRANT ALL ON *.* TO 'mikadev'@'%';
	FLUSH PRIVILEGES;
MARIADBUSERQUERY

## Configure and enabling arrangodb

function waitArango {
	while :; do
		curl -sI 'http://localhost:8529/' | grep 'HTTP/1.1 301' > /dev/null 2>&1 && break
		sleep 1
	done
}

sed -i 's|endpoint =.*|endpoint = tcp://0.0.0.0:8529|' /etc/arangodb3/arangod.conf
sed -i 's/authentication =.*/authentication = false/' /etc/arangodb3/arangod.conf
systemctl enable arangodb3.service
systemctl start arangodb3.service
waitArango
cat <<-ARANGOINIT | arangosh  --quiet --server.username "root" --server.password "" --server.database "_system"
	require("org/arangodb/users").save("mikadev", "mikadev")
ARANGOINIT
sed -i 's/authentication =.*/authentication = true/' /etc/arangodb3/arangod.conf
systemctl restart arangodb3.service

## Mosquitto build preparation
yum install -y c-ares-devel libwebsockets-devel openssl-devel libuuid-devel libcurl-devel libwebsockets hiredis-devel
mkdir -p /opt/mosquitto_build

## Build and Install mosquitto
cd /opt/mosquitto_build
curl -s -OL http://mosquitto.org/files/source/mosquitto-1.4.15.tar.gz
tar -xzf mosquitto-1.4.15.tar.gz
chown -R root:root mosquitto-1.4.15
cd mosquitto-1.4.15
sed -i 's/WITH_WEBSOCKETS:=no/WITH_WEBSOCKETS:=yes/' config.mk
make
make install

## Build mosquitto-auth-plugin
cd /opt/mosquitto_build
curl -s -OL https://github.com/jpmens/mosquitto-auth-plug/archive/0.1.1.zip
unzip 0.1.1.zip
cd mosquitto-auth-plug-0.1.1
cp config.mk.in config.mk
sed -i 's/BACKEND_MYSQL ?= yes/BACKEND_MYSQL ?= no/' config.mk
sed -i 's/BACKEND_REDIS ?= no/BACKEND_REDIS ?= yes/' config.mk
sed -i 's|^MOSQUITTO_SRC =|MOSQUITTO_SRC = /opt/mosquitto_build/mosquitto-1.4.15|g' config.mk
make
strip np auth-plug.so
cp np /opt/mosquitto_build
cp auth-plug.so /opt/mosquitto_build

cd /

## Adding ld config path
echo "/usr/local/lib" >> /etc/ld.so.conf.d/usrlocallib.conf
ldconfig

cat <<-MOSQUITTOCONFIG > /etc/mosquitto/mosquitto.conf
	# mika - mosquitto configuration for push notification
	# NOTE : mosqutto configuration parser is rather weird. please strictly use one line per comment
	#        and no whitespace in configuration key
	# see mosquitto man page : man mosquitto.conf

	# basic 'sane' protocol configuration
	retry_interval 20
	max_inflight_messages 0
	max_queued_messages 0 
	queue_qos0_messages true
	message_size_limit 0
	# every client need an id
	allow_zero_length_clientid false
	# store persistance message, at most 1 week    
	persistent_client_expiration 1w     
	allow_duplicate_messages false

	# save on autosave on time interval
	autosave_on_changes false
	# save persitance every 10 minutes
	autosave_interval 600       

	# default listener
	listener 1883 0.0.0.0
	protocol mqtt
	max_connections 1000

	# enable websocket listener
	listener 1884 0.0.0.0
	protocol websockets
	max_connections 100000

	# disable anonymous access
	allow_anonymous false

	# enable mosquitto auth plugin - redis
	auth_plugin /opt/mosquitto_build/auth-plug.so

	auth_opt_backends redis
	# use local redis server
	auth_opt_redis_host 127.0.0.1
	auth_opt_redis_port 6379
	# auth_opt_redis_pass redispassword
	auth_opt_redis_userquery GET mika-v3-dev:mosq:%s
	auth_opt_redis_aclquery GET mika-v3-dev:mosqacl:%s:%s
	auth_opt_superusers superuser
	auth_opt_acl_cacheseconds 0
	auth_opt_auth_cacheseconds 0
	auth_opt_acl_cachejitter 0
	auth_opt_auth_cachejitter 0
	auth_opt_log_quiet false
MOSQUITTOCONFIG

cat <<-MOSQUITTOMSCONFIG > /etc/mosquitto/mosquitto-ms.conf
	# mika - mosquitto configuration for microservice
	# NOTE : mosqutto configuration parser is rather weird. please strictly use one line per comment
	#        and no whitespace in configuration key
	# see mosquitto man page : man mosquitto.conf
	# or see example config on /etc/mosquitto.conf

	# basic 'sane' protocol configuration
	retry_interval 20
	max_inflight_messages 0
	max_queued_messages 0 
	queue_qos0_messages true
	message_size_limit 0
	# every client need an id
	allow_zero_length_clientid false
	# store persistance message, at most 1 week    
	persistent_client_expiration 1d
	allow_duplicate_messages false

	# save on autosave on time interval
	autosave_on_changes false
	# save persitance every 10 minutes
	autosave_interval 600       

	# default listener
	listener 5000 0.0.0.0
	protocol mqtt
	max_connections 1000

	allow_anonymous true

	# password_file /etc/mosquitto/mspwfile
MOSQUITTOMSCONFIG

## Adding mosquitto superuser
echo "set mika-v3-dev:mosq:superuser $(/opt/mosquitto_build/np -p superuser)" | redis-cli

## Adding user mosquitto
useradd mosquitto -M -d /etc/mosquitto

## Adding service for mosquitto
cat <<-MOSQUITTOSYSTEMDSERVICE > /etc/systemd/system/mosquitto.service
	[Unit]
	Description=Mosquitto MQTT v3.1/v3.1.1 Broker
	After=network-online.target
	Wants=network-online.target

	[Service]
	Type=simple
	ExecStart=/usr/local/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf
	Restart=on-failure

	[Install]
	WantedBy=multi-user.target
MOSQUITTOSYSTEMDSERVICE

cat <<-MOSQUITTOMSSYSTEMDSERVICE > /etc/systemd/system/mosquitto-ms.service
	[Unit]
	Description=Mosquitto MQTT v3.1/v3.1.1 Broker for microservices
	After=network-online.target
	Wants=network-online.target

	[Service]
	Type=simple
	ExecStart=/usr/local/sbin/mosquitto -c /etc/mosquitto/mosquitto-ms.conf
	Restart=on-failure

	[Install]
	WantedBy=multi-user.target
MOSQUITTOMSSYSTEMDSERVICE

systemctl daemon-reload
systemctl enable mosquitto mosquitto-ms
systemctl start mosquitto mosquitto-ms


echo "backend-v3 development provisioning done"