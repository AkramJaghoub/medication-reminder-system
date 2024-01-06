package ju.pm.com.example.remindersystem.service;

import jakarta.transaction.Transactional;
import ju.pm.com.example.remindersystem.dto.MedicationDto;
import ju.pm.com.example.remindersystem.exception.MedicationAlreadyExistsException;
import ju.pm.com.example.remindersystem.exception.MedicationNotFoundException;
import ju.pm.com.example.remindersystem.model.ApiResponse;
import ju.pm.com.example.remindersystem.model.Medication;
import ju.pm.com.example.remindersystem.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import static ju.pm.com.example.remindersystem.Util.Utils.getSideEffectsBasedOnMedicationName;
import static ju.pm.com.example.remindersystem.Util.Utils.isNotEqual;
import static ju.pm.com.example.remindersystem.model.Status.TAKEN;
import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;

    @Transactional
    public ApiResponse addMedication(MedicationDto medDto) {
        try {
            Medication medication = new Medication().toEntity(medDto);
            if (medicationRepository.existsByMedicationName(medication.getMedicationName())) {
                throw new MedicationAlreadyExistsException("Medication name [" + medication.getMedicationName() + "] already exists");
            }

            medicationRepository.save(medication);
            return new ApiResponse("Medication name [" + medication.getMedicationName() + "] was saved successfully", CREATED);
        } catch (MedicationAlreadyExistsException ex) {
            return new ApiResponse(ex.getMessage(), BAD_REQUEST);
        }
    }

    public void setUpMedicationsPage(Model model) {
        List<Medication> medications = getMedicationsList();
        model.addAttribute("medications", medications);
    }

    public List<Medication> getMedicationsList() {
        return medicationRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Medication::getPostDate).reversed())
                .toList();
    }

    @Transactional
    public ApiResponse trackMedicationStatus(String status, long medicationId) {
        try {
            Medication medication = medicationRepository.findById(medicationId)
                    .orElseThrow(() -> new MedicationNotFoundException("Medication with id [" + medicationId + "] was not found"));

            int timesTaken = medication.getTimesTaken();
            int timesMissed = medication.getTimesMissed();

            if (Objects.equals(status, TAKEN.name().toLowerCase())) {
                medication.setTimesTaken(++timesTaken);
            } else {
                medication.setTimesMissed(++timesMissed);
            }

            medicationRepository.save(medication);
            return new ApiResponse("Medication name [" + medication.getMedicationName() + "] was tracked successfully", OK);
        } catch (MedicationNotFoundException ex) {
            return new ApiResponse(ex.getMessage(), BAD_REQUEST);
        }
    }

    @Transactional
    public ApiResponse updateMedication(MedicationDto medDto, long medicationId) {
        try {
            Medication existingMedication = medicationRepository.findById(medicationId)
                    .orElseThrow(() -> new MedicationNotFoundException("Medication with id [" + medicationId + "] was not found"));

            if (isNotEqual(medDto.getMedicationName(), existingMedication.getMedicationName()) &&
                    medicationRepository.existsByMedicationName(medDto.getMedicationName())) {
                throw new MedicationAlreadyExistsException("A medication with with the same name already exists!");
            }

            existingMedication.setMedicationName(medDto.getMedicationName());
            existingMedication.setMedicationTime(medDto.getMedicationTime());
            existingMedication.setSideEffectsDescription(getSideEffectsBasedOnMedicationName(medDto.getMedicationName()));
            existingMedication.setTimesTaken(0);
            existingMedication.setTimesMissed(0);
            existingMedication.setPostDate(LocalDateTime.now());

            medicationRepository.save(existingMedication);
            return new ApiResponse("Medication was updated successfully", OK);
        } catch (MedicationNotFoundException ex){
            return new ApiResponse(ex.getMessage(), BAD_REQUEST);
        }
    }
}