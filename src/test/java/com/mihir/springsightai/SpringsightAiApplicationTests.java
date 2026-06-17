package com.mihir.springsightai;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Basic context loads verification test for the Springsight AI application.
 * Overrides datasource properties to run tests against an in-memory H2 database
 * rather than requiring a live MySQL connection.
 */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class SpringsightAiApplicationTests {

	@Test
	void contextLoads() {
	}

}
