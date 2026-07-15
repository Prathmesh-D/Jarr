package com.jarr.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Standard paginated list response envelope per TRD Section 4:
 * { data: [...], page, totalPages, totalElements }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> data;
    private int page;
    private int totalPages;
    private long totalElements;
}
