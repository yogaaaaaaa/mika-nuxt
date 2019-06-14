import { ExportToCsv } from "export-to-csv";
import Pick from 'lodash.pick';

export default {
  data() {
    return {
      result: [],
      arr: []
    }
  },
  methods: {
    toCSV(data) {
      this.toArray(this.pivot(data))
      const options = {
        fieldSeparator: ",",
        quoteStrings: '"',
        decimalseparator: ".",
        showLabels: true,
        showTitle: true,
        title: "CSV Data",
        useBom: true,
        useKeysAsHeaders: true,
      };
      if (data.length) {
        const csvExporter = new ExportToCsv(options);
        csvExporter.generateCsv(this.filterPick(this.arr));
        // csvExporter.generateCsv(this.arr);
      } else {
        return alert("No data available");
      }
    },
    pivot(arr) {
      var mp = new Map();
      
      function setValue(a, path, val) {
        if (Object(val) !== val) {
          var pathStr = path.join('.');
          var i = (mp.has(pathStr) ? mp : mp.set(pathStr, mp.size)).get(pathStr);
          a[i] = val;
        } 
        else {
          for (var key in val) {
            setValue(a, key == '0' ? path : path.concat(key), val[key]);            
          }
        }
        return a;
      }
      
      var result = arr.map( obj => setValue([], [], obj) );
      return [[...mp.keys()], ...result];
    },
    toArray(data){
        let header = data.shift();
        let event = data.splice(0);
        let value, key;
        
        for(var i = 0; i<event.length; i++) {
          var obj = {};
          for (var j = 0; j<event[i].length; j++){
            key = header[j]
            value = event[i][j]
            obj[key] = value;
          }
          this.arr.push(obj)
        }
        return this.arr
    },
    filterPick(data) {
      for(var i = 0; i< data.length; i++){
        var tot = Pick(data[i], this.filter)
        this.result.push(tot)
      }
      return this.result;
    }
  }
};
