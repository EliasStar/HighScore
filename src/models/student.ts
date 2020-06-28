import { getStudents } from '../api/list';

export default class {
    static nameForID(id: string) {
        for (const student of getStudents()) {
            if (student.id === id) {
                return `${student.name.last} ${student.name.first}`;
            }
        }

        return "";
    }

    static find(gender: genderFilter, className: classFilter) {
        let result: Student[] = [];

        getStudents().forEach(student => {
            if ((className === "ALL" || student.class === className) && (gender === "both" || student.gender === gender)) {
                result.push(student);
            }
        });

        return result;
    }

    static findById(id: string) {
        for (const student of getStudents()) {
            if (student.id === id) {
                return student;
            }
        }

        return null;
    }
}
