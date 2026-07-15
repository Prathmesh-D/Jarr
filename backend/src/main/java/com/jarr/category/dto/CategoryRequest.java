package com.jarr.category.dto;

import com.jarr.common.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 60, message = "Name must be less than 60 characters")
    private String name;

    @NotBlank(message = "Icon key is required")
    private String iconKey;

    @NotBlank(message = "Color hex is required")
    @Size(max = 7, message = "Color hex must be a valid hex code")
    private String colorHex;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;
}
