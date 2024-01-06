package ju.pm.com.example.remindersystem.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class MedicationDto {

    private String medicationName;
    private int medicationTime;
}
