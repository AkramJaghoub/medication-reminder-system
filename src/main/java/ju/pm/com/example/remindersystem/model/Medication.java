package ju.pm.com.example.remindersystem.model;

import jakarta.persistence.*;
import ju.pm.com.example.remindersystem.dto.MedicationDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static ju.pm.com.example.remindersystem.Util.Utils.getSideEffectsBasedOnMedicationName;

@Data
@NoArgsConstructor(force = true)
@AllArgsConstructor
@Builder
@Entity
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String medicationName;
    private LocalDateTime postDate;
    private int medicationTime;
    private int timesTaken;
    private int timesMissed;
    @Column(columnDefinition = "LONGTEXT")
    private String sideEffectsDescription;

    public Medication toEntity(MedicationDto medDto) {
        return Medication.builder()
                .medicationName(medDto.getMedicationName())
                .medicationTime(medDto.getMedicationTime())
                .postDate(LocalDateTime.now())
                .sideEffectsDescription(getSideEffectsBasedOnMedicationName(medDto.getMedicationName()))
                .build();
    }
}
