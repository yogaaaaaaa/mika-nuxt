package id.mikaapp.mika.utils;

import java.text.DecimalFormat;
import java.text.NumberFormat;

/**
 * Created by danielhc on 02/03/18.
 */

public class NumberUtil {

    public static String formatCurrency(double number) {
        NumberFormat formatter = new DecimalFormat("Rp #,###,###,###,###");
        String result = formatter.format(number).replace(",", ".");
        if (result.charAt(result.length() - 3) == '.') {
            StringBuilder myName = new StringBuilder(result);
            myName.setCharAt(result.length() - 3, ',');
            result = myName.toString();
        } else if (result.charAt(result.length() - 2) == '.') {
            StringBuilder myName = new StringBuilder(result);
            myName.setCharAt(result.length() - 2, ',');
            result = myName.toString();
        }
        return result;
    }
}
