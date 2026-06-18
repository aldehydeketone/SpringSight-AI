package com.mihir.springsightai.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a warning message summary with its occurrences count.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarningSummary {
    private String message;
    private Long count;
}
