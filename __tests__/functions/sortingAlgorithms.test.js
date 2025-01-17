const { quickSort, mergeSort } = require('../../utils/sortingAlgorithms');

describe("Sorting algorithm functions", () => {
    
    let students = [ "Emmanuel","Asidigbe","Julius","Markwei","Mubarak"]

    const compareFunc = (a, b) => {
        return a.localeCompare(b);
    }

    it("Should sort an array using quick sort", () => {
        expect(quickSort(students, compareFunc)).toEqual([ 'Asidigbe', 'Emmanuel', 'Julius', 'Markwei', 'Mubarak' ]);
    })

    it("Should sort an array using merge sort", () => {
        expect(mergeSort(students, compareFunc)).toEqual([ 'Asidigbe', 'Emmanuel', 'Julius', 'Markwei', 'Mubarak' ]);
    })

})