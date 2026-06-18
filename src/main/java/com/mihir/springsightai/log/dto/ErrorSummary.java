package com.mihir.springsightai.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing an error message summary with its occurrences count.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorSummary {
    private String message;
    private Long count;
}
