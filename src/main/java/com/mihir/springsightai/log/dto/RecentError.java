package com.mihir.springsightai.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO representing a recent error entry with its timestamp and message.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentError {
    private LocalDateTime timestamp;
    private String message;
}
