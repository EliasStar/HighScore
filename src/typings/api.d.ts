type genderFilter = "male" | "female" | "both";
type classFilter = "ALL" | string;

interface Student {
    id: string;
    name: {
        first: string;
        last: string;
    };
    class: string;
    gender: "male" | "female";
}