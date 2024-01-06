package ju.pm.com.example.remindersystem.Util;

public final class Utils {

    private Utils() {
    }

    public static String getSideEffectsBasedOnMedicationName(String medicationName){
        return switch (medicationName.toLowerCase()){
            case "digoxin" -> "Common side effects of digoxin include nausea, vomiting, loss of appetite, blurred or yellow vision, confusion, irregular heartbeat, dizziness, fatigue, and potential electrolyte imbalances. Serious side effects may occur, and it's crucial to report any unusual symptoms to a healthcare provider promptly.";
            case "exforge hct" -> "Common side effects of Exforge HCT include dizziness, headache, and swelling. Serious side effects can include low blood pressure, electrolyte imbalances, and kidney problems.";
            case "metformin" -> "Common side effects of metformin include gastrointestinal issues such as nausea, diarrhea, and abdominal discomfort. Rarely, it may lead to lactic acidosis, a serious condition requiring immediate medical attention.";
            case "vastor" -> "Vastor may commonly cause muscle pain, weakness, and digestive issues like nausea. Rare but serious side effects can include liver problems and an increased risk of diabetes.";
            default -> throw new IllegalStateException("Unexpected value: " + medicationName.toLowerCase());
        };
    }
}