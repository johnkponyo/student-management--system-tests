// Sorting algorithms: QuickSort and MergeSort

// QuickSort implementation
const quickSort = (arr, compareFunc) => {
    if (arr.length <= 1) return arr;
  
    const pivot = arr[0];
    const left = [];
    const right = [];
  
    for (let i = 1; i < arr.length; i++) {
      if (compareFunc(arr[i], pivot) < 0) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
  
    return [...quickSort(left, compareFunc), pivot, ...quickSort(right, compareFunc)];
  };
  


  // MergeSort implementation
  const mergeSort = (arr, compareFunc) => {
    
    if (arr.length <= 1) return arr;
  
    const middle = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, middle), compareFunc);
    const right = mergeSort(arr.slice(middle), compareFunc);
  
    return merge(left, right, compareFunc);
  };
  
  const merge = (left, right, compareFunc) => {
    let result = [];
    let leftIndex = 0;
    let rightIndex = 0;
  
    while (leftIndex < left.length && rightIndex < right.length) {
      if (compareFunc(left[leftIndex], right[rightIndex]) < 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }
  
    return result.concat(left.slice(leftIndex), right.slice(rightIndex));
  };
  
  module.exports = { quickSort, mergeSort };
  