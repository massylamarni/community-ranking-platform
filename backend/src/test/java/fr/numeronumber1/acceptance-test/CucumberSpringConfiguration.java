package fr.numeronumber1;

import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@CucumberContextConfiguration
@SpringBootTest(
		classes = Numero1Application.class,
		properties = {
				"DB_URL=jdbc:mysql://host.docker.internal:3306/numero_number_one?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
				"DB_USERNAME=root",
				"DB_PASSWORD=root",
				"MAIL_HOST=localhost",
				"MAIL_PORT=2525",
				"MAIL_USERNAME=cucumber",
				"MAIL_PASSWORD=cucumber"
		}
)
@AutoConfigureMockMvc
public class CucumberSpringConfiguration {

	@MockitoBean
	JavaMailSender mailSender;
}
