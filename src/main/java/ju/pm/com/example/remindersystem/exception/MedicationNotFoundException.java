package ju.pm.com.example.remindersystem.exception;

public class MedicationNotFoundException extends RuntimeException{

    public MedicationNotFoundException(String message){
        super(message);
    }
}
