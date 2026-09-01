package com.mihir.springsightai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SpringsightAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringsightAiApplication.class, args);
	}

}
