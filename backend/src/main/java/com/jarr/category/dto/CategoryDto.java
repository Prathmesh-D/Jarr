package com.jarr.category.dto;

import com.jarr.common.TransactionType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDto {
    private Long id;
    private String name;
    private String iconKey;
    private String colorHex;
    private TransactionType type;
    private Boolean isDefault;
}
