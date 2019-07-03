package id.mikaapp.mika.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

/**
 * Created by danielhc on 02/03/18.
 */

public class DateUtil {

    public static String[] months = new String[]{
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    };

    public static String[] fullMonths = new String[]{
            "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober",
            "November", "Desember"
    };

    public static int[] dateMonth = new int[]{
            Calendar.JANUARY, Calendar.FEBRUARY, Calendar.MARCH, Calendar.APRIL, Calendar.MAY, Calendar.JUNE,
            Calendar.JULY, Calendar.AUGUST, Calendar.SEPTEMBER, Calendar.OCTOBER, Calendar.NOVEMBER, Calendar.DECEMBER
    };

    public static String getDayOfMonthSuffix(final int n) {
        if (n >= 11 && n <= 13) {
            return "th";
        }
        switch (n % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    public static String formatDate(Date date) {
        SimpleDateFormat monthFormat = new SimpleDateFormat("MMMM", Locale.ENGLISH);
        SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy", Locale.ENGLISH);

        StringBuilder sb = new StringBuilder();
        sb.append(date.getDate());
        sb.append("-");
        sb.append(months[date.getMonth()]);
        sb.append("-");
        sb.append(yearFormat.format(date));

        return sb.toString();
    }

    public static String formatHour(Date date) {
        SimpleDateFormat monthFormat = new SimpleDateFormat("HH:mm", Locale.ENGLISH);
        return monthFormat.format(date);
    }

    public static String getHour(String dateString) {
        Date date = fromISO8601UTC(dateString);
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);

        SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss", Locale.getDefault());

        return dateFormat.format(calendar.getTime());
    }

    public static String utcToLocal(String dateString) {
        Date date = fromISO8601UTC(dateString);
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.000'Z'", Locale.getDefault());

        return dateFormat.format(calendar.getTime());
    }

    public static Date fromISO8601UTC(String dateStr) {
        TimeZone tz = TimeZone.getTimeZone("UTC");

        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.000'Z'", Locale.ENGLISH);
        df.setTimeZone(tz);

        try {
            return df.parse(dateStr);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return null;
    }

    public static String getDate(String dateString) {
        SimpleDateFormat serverDateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);

        try {
            Date date = serverDateFormat.parse(dateString.substring(0, 10));
            return formatDate(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return "";
    }

    public static String[] days = new String[]{"Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"};

    private static String formatDateWithDay(Date date) {

        SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy", Locale.ENGLISH);

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 7; i++) {
            if (date.getDay() == i) {
                sb.append(days[i]);
            }
        }

        sb.append(", ");
        sb.append(date.getDate());
        sb.append("-");
        sb.append(months[date.getMonth()]);
        sb.append("-");
        sb.append(yearFormat.format(date));

        return sb.toString();
    }

    public static String getDateWithDay(String dateString) {
        SimpleDateFormat serverDateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);

        try {
            Date date = serverDateFormat.parse(dateString.substring(0, 10));
            return formatDateWithDay(date);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return "";
    }

    public static long getMillisDate(String dateString) {
        SimpleDateFormat serverDateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);

        try {
            Date date = serverDateFormat.parse(dateString.substring(0, 10));
            return date.getTime();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public static long getTokenLongDiff() {
        return 23 * 60 * 60 * 1000;
    }
}
