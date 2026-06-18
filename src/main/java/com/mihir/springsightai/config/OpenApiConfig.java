package com.mihir.springsightai.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI springSightOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SpringSight AI API")
                        .version("1.0.0")
                        .description("Backend APIs for authentication, secure log upload, parsing, analysis, AI root cause reports, report history, dashboard summaries, and PDF export."))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi springSightApiGroup() {
        return GroupedOpenApi.builder()
                .group("springsight-ai")
                .pathsToMatch("/api/**")
                .build();
    }
}
