package id.mikaapp.mika.utils;

import id.mikaapp.mika.R;

/**
 * Created by grahamdesmon on 17/01/19.
 */

public class StripeUtil {
    public static final String AMERICAN_EXPRESS = "American Express";
    public static final String DISCOVER = "Discover";
    public static final String JCB = "JCB";
    public static final String DINERS_CLUB = "Diners Club";
    public static final String VISA = "Visa";
    public static final String MASTERCARD = "MasterCard";
    public static final String UNKNOWN = "Unknown";

    public static final String[] PREFIXES_AMERICAN_EXPRESS = {"34", "37"};
    public static final String[] PREFIXES_DISCOVER = {"60", "62", "64", "65"};
    public static final String[] PREFIXES_JCB = {"35"};
    public static final String[] PREFIXES_DINERS_CLUB = {"300", "301", "302", "303", "304", "305", "309", "36", "38", "39"};
    public static final String[] PREFIXES_VISA = {"4"};
    public static final String[] PREFIXES_MASTERCARD = {
            "2221", "2222", "2223", "2224", "2225", "2226", "2227", "2228", "2229",
            "223", "224", "225", "226", "227", "228", "229",
            "23", "24", "25", "26",
            "270", "271", "2720",
            "50", "51", "52", "53", "54", "55"
    };

    public static String getBrand(String number) {
        String evaluatedType;
        if (hasAnyPrefix(number, PREFIXES_AMERICAN_EXPRESS)) {
            evaluatedType = AMERICAN_EXPRESS;
        } else if (hasAnyPrefix(number, PREFIXES_DISCOVER)) {
            evaluatedType = DISCOVER;
        } else if (hasAnyPrefix(number, PREFIXES_JCB)) {
            evaluatedType = JCB;
        } else if (hasAnyPrefix(number, PREFIXES_DINERS_CLUB)) {
            evaluatedType = DINERS_CLUB;
        } else if (hasAnyPrefix(number, PREFIXES_VISA)) {
            evaluatedType = VISA;
        } else if (hasAnyPrefix(number, PREFIXES_MASTERCARD)) {
            evaluatedType = MASTERCARD;
        } else {
            evaluatedType = UNKNOWN;
        }
        return evaluatedType;
    }

    public static int getLogo(String number) {
        int resource;
        if (hasAnyPrefix(number, PREFIXES_AMERICAN_EXPRESS)) {
            resource = R.drawable.logo_american_express;
        } else if (hasAnyPrefix(number, PREFIXES_DISCOVER)) {
            resource = R.drawable.logo_discovers;
        } else if (hasAnyPrefix(number, PREFIXES_JCB)) {
            resource = R.drawable.logo_jcb;
        } else if (hasAnyPrefix(number, PREFIXES_DINERS_CLUB)) {
            resource = R.drawable.logo_diners_club;
        } else if (hasAnyPrefix(number, PREFIXES_VISA)) {
            resource = R.drawable.logo_visa;
        } else if (hasAnyPrefix(number, PREFIXES_MASTERCARD)) {
            resource = R.drawable.logo_mastercard;
        } else resource = 0;

        return resource;
    }

    public static boolean hasAnyPrefix(String number, String... prefixes) {
        if (number == null) {
            return false;
        }
        for (String prefix : prefixes) {
            if (number.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
}
