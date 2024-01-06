package ju.pm.com.example.remindersystem.exception;

public class MedicationAlreadyExistsException extends RuntimeException{

    public MedicationAlreadyExistsException(String message){
        super(message);
    }
}
