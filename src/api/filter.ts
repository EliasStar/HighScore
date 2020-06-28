import { getClasses } from './list';

export function genderFromString(gender?: string): genderFilter {
    if (!gender) return "both";

    switch (gender.toUpperCase()) {
        case "MALE":
        case "M": return "male";
        case "FEMALE":
        case "F": return "female";
        default: return "both"
    }
}

export function classFromString(className?: string): classFilter {
    if (className) {
        for (const cls of getClasses()) {
            if (className.toUpperCase() === cls) return cls;
        }
    }

    return "ALL";
}