package ju.pm.com.example.remindersystem.controller;

import ju.pm.com.example.remindersystem.dto.MedicationDto;
import ju.pm.com.example.remindersystem.model.ApiResponse;
import ju.pm.com.example.remindersystem.model.Medication;
import ju.pm.com.example.remindersystem.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/rms/patient/dashboard")
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping()
    public String setUpPatientDashboard(Model model){
        medicationService.setUpMedicationsPage(model);
        return "patient-dashboard";
    }

    @GetMapping("/get-medications")
    public ResponseEntity<?> getMedications(){
        List<Medication> medications = medicationService.getMedicationsList();
        return ResponseEntity.ok(medications);
    }

    @PostMapping("/add-medication")
    public ResponseEntity<?> addMedication(@RequestBody MedicationDto medDto){
        ApiResponse response = medicationService.addMedication(medDto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/update-medication/{medicationId}")
    public ResponseEntity<?> updateMedication(@RequestBody MedicationDto medDto,
                                              @PathVariable("medicationId") long medicationId){
        ApiResponse response = medicationService.updateMedication(medDto, medicationId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/medication-tracker/{status}")
    public ResponseEntity<?> trackMedicationStatus(@PathVariable("status") String status,
                                                   @RequestParam("medicationId") long medicationId){
        ApiResponse response = medicationService.trackMedicationStatus(status, medicationId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
