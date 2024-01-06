package ju.pm.com.example.remindersystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class ReminderSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReminderSystemApplication.class, args);
	}

}
