package ju.pm.com.example.remindersystem.repository;

import ju.pm.com.example.remindersystem.model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    boolean existsByMedicationName(String medicationName);
}
