define(function(){

    var Asplice = Array.prototype.splice;
    
    /**
     * Real matrix.
     * @constructor
     * @param {array} newData - A 2D array containing data for the matrix.
     */
    function Matrix(newData) {
        if(newData instanceof Matrix) return newData;
        var rows, columns, i = 0;

        rows = newData.length;
        columns = newData[0].length;
        
        if(columns===undefined)
            throw "Data must be a 2D array.";
        
        for (; i < rows; i++) {
            if (newData[i].length !== columns)
                throw "Inconsistent array dimensions";
        }

        newData.rows = rows;
        newData.columns = columns;
        
        newData.__proto__ = Matrix.prototype;
        
        return newData;
    }
    
    /**
     * Constructs a Matrix with the chosen dimensions from a 1D array.
     * @param {number} newRows - Number of rows
     * @param {number} newColumns - Number of columns
     * @param {array} newData - A 1D array containing data for the matrix
     */
    Matrix.from1DArray = function (newRows, newColumns, newData) {
        var length, data, i = 0;

        length = newRows * newColumns;
        if (length !== newData.length)
            throw "Data length does not match given dimensions.";

        data = new Array(newRows);
        for (; i < newRows; i++) {
            data[i] = newData.slice(i*newColumns,(i+1)*newColumns);
        }
        return new Matrix(data);
    };
    
    /**
     * Creates a row vector, a matrix with only one row.
     * @param {array} newData - A 1D array containing data for the vector
     */
    Matrix.rowVector = function (newData) {
        return new Matrix([newData]);
    };
    
    /**
     * Creates a column vector, a matrix with only one column.
     * @param {array} newData - A 1D array containing data for the vector
     */
    Matrix.columnVector = function (newData) {
        var l = newData.length, vector = new Array(l);
        for(var i = 0; i < l; i++)
            vector[i] = [newData[i]];
        return new Matrix(vector);
    };

    /**
     * Creates an empty matrix with the given dimensions. Values will be undefined.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     */
    Matrix.empty = function (rows, columns) {
        var array = new Array(rows);
        for(var i = 0; i < rows; i++) {
            array[i] = new Array(columns);
        }
        return new Matrix(array);
    };

    /**
     * Creates a matrix with the given dimensions. Values will be set to zero.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     */
    Matrix.zeros = function (rows, columns) {
        return Matrix.empty(rows, columns).fill(0);
    };

    /**
     * Creates a matrix with the given dimensions. Values will be set to one.
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     */
    Matrix.ones = function (rows, columns) {
        return Matrix.empty(rows, columns).fill(1);
    };

    /**
     * Creates a matrix with the given dimensions. Values will be randomly set using Math.random().
     * @param {number} rows - Number of rows
     * @param {number} columns - Number of columns
     */
    Matrix.rand = function (rows, columns) {
        var matrix = Matrix.empty(rows, columns);
        return matrix.apply(function (i, j) { this[i][j] = Math.random(); });
    };

    /**
     * Creates an identity matrix with the given dimension. Values of the diagonal will be 1 and other will be 0;
     * @param {number} n - Number of rows and columns
     */
    Matrix.eye = function (n) {
        var matrix = Matrix.zeros(n, n), l = matrix.rows;
        for(var i = 0; i < l; i++){
            matrix[i][i] = 1;
        }
        return matrix;
    };

    /**
     * Creates a diagonal matrix based on the given array. 
     * @param {array} data - Array containing the data for the diagonal
     */
    Matrix.diag = function (data) {
        var l = data.length, matrix = Matrix.zeros(l,l);
        for(var i = 0; i < l; i++){
            matrix[i][i] = data[i];
        }
        return matrix;
    };

    Matrix.prototype = {
        /**
         * @property {number} - The number of elements in the matrix.
         */
        get size() {
            return this.rows * this.columns;
        },
        /* Internal methods */
        checkRowIndex : function(index) {
            if(index < 0 || index > this.rows-1)
                throw "Row index out of range.";
        },
        checkColumnIndex : function(index) {
            if(index < 0 || index > this.columns-1)
                throw "Column index out of range.";
        },
        checkDimensions : function(otherMatrix) {
            if((this.rows !== otherMatrix.rows)||(this.columns !== otherMatrix.columns))
                throw "Matrices dimensions must be equal.";
        },
        /**
         * Applies a callback for each element of the matrix. 
         * @param {function} callback - Function that will be called with two parameters : i (index of the row) and j (index of the column)
         */
        apply: function (callback) {
            var ii = this.rows, jj = this.columns;
            for (var i = 0; i < ii; i++) {
                for (var j = 0; j < jj; j++) {
                    callback.call(this, i, j);
                }
            }
            return this;
        },
        /**
         * Creates an exact and independent copy of the matrix
         */
        clone : function() {
            return new Matrix(this.to2DArray());
        },
        /**
         * Returns a new 1D array filled row by row with the matrix values
         */
        to1DArray : function() {
            var array = [], l = this.rows;
            for(var i = 0; i < l; i++){
                array = array.concat(this[i]);
            }
            return array;
        },
        /**
         * Returns a 2D array containing the data
         */
        to2DArray : function() {
            var l = this.rows, copy = new Array(l);
            for(var i = 0; i < l; i++) {
                copy[i] = this[i].slice();
            }
            return copy;
        },
        /**
         * Returns true if the matrix has one row
         */
        isRowVector : function() {
            return this.rows === 1;
        },
        /**
         * Returns true if the matrix has one column
         */
        isColumnVector : function() {
            return this.columns === 1;
        },
        /**
         * Returns true if the matrix has one row or one column
         */
        isVector : function() {
            return (this.rows === 1) || (this.columns === 1);
        },
        /**
         * Returns true if the matrix has the same number of rows and columns
         */
        isSquare : function() {
            return this.rows === this.columns;
        },
        /**
         * Returns true if the matrix has the same values on both sides of the diagonal
         */
        isSymmetric : function() {
            if (this.isSquare()) {
                var l = this.rows
                for (var i = 0; i < l; i++) {
                    for (var j = 0; j <= i; j++) {
                        if (this[i][j] !== this[j][i]) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        },
        /**
         * Sets a given element of the matrix. mat.set(3,4,1) is equivalent to matrix[3][4]=1
         * @param {number} rowIndex - Index of the row
         * @param {number} columnIndex - Index of the column
         * @param {value} value - The new value for the element
         */
        set : function(rowIndex, columnIndex, value) {
            this[rowIndex][columnIndex] = value;
            return this;
        },
        /**
         * Gets a given element of the matrix. mat.get(3,4) is equivalent to matrix[3][4]
         * @param {number} rowIndex - Index of the row
         * @param {number} columnIndex - Index of the column
         */
        get : function(rowIndex, columnIndex) {
            return this[rowIndex][columnIndex];
        },
        /**
         * Fills the matrix with a given value. All elements will be set to this value.
         * @param {number} value - New value
         */
        fill: function (value) {
            return this.apply(function (i, j) { this[i][j] = value; });
        },
        /**
         * Negate the matrix. All elements will be multiplied by (-1)
         */
        neg : function () {
            return this.mulS(-1);
        },
        /**
         * Adds a scalar or values from another Matrix (in place)
         * @param {number|Matrix} value
         * @returns {this}
         */
        add : function(value) {
            if(typeof value === "number")
                return this.addS(value);
            if(value instanceof Matrix)
                return this.addM(value);
        },
        addS : function(value) {
            return this.apply(function (i, j) { this[i][j] += value; });
        },
        addM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (i, j) { this[i][j] += value[i][j]; });
        },
        /**
         * Substracts a scalar or values from another Matrix (in place)
         * @param {number|Matrix} value
         * @returns {this}
         */
        sub : function(value) {
            if(typeof value === "number")
                return this.subS(value);
            if(value instanceof Matrix)
                return this.subM(value);
        },
        subS : function(value) {
            return this.apply(function (i, j) { this[i][j] -= value; });
        },
        subM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (i, j) { this[i][j] += value[i][j]; });
        },
        /**
         * Multiplies a scalar or values from another Matrix (in place)
         * @param {number|Matrix} value
         * @returns {this}
         */
        mul : function(value) {
            if(typeof value === "number")
                return this.mulS(value);
            if(value instanceof Matrix)
                return this.mulM(value);
        },
        mulS : function(value) {
            return this.apply(function (i, j) { this[i][j] *= value; });
        },
        mulM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (i, j) { this[i][j] *= value[i][j]; });
        },
        /**
         * Divides a scalar or values from another Matrix (in place)
         * @param {number|Matrix} value
         * @returns {this}
         */
        div : function(value) {
            if(typeof value === "number")
                return this.divS(value);
            if(value instanceof Matrix)
                return this.divM(value);
        },
        divS : function(value) {
            return this.apply(function (i, j) { this[i][j] /= value; });
        },
        divM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (i, j) { this[i][j] /= value[i][j]; });
        },
        /**
         * Returns a new row vector from the given index
         * @param {number} index - Row index
         * @returns {Matrix}
         */
        getRow : function(index) {
            this.checkRowIndex(index);
            return new Matrix([this[index].slice()]);
        },
        /**
         * Sets a row at the given index
         * @param {number} index - Row index
         * @param {array|Matrix} Array or row vector
         * @returns {this}
         */
        setRow : function(index, array) {
            this.checkRowIndex(index);
            if(!(array instanceof Matrix)) array = Matrix.rowVector(array);
            if(array.columns !== this.columns)
                throw "Invalid row size";
            this[index] = array[0].slice();
            return this;
        },
        /**
         * Removes a row from the given index
         * @param {number} index - Row index
         * @returns {this}
         */
        removeRow : function(index) {
            this.checkRowIndex(index);
            if(this.rows===1)
                throw "A matrix cannot have less than one row";
            Asplice.call(this, index, 1);
            this.rows -= 1;
            return this;
        },
        /**
         * Adds a row at the given index
         * @param {number} index - Row index
         * @param {array|Matrix} Array or row vector
         * @returns {this}
         */
        addRow : function(index, array) {
            if(index < 0 || index > this.rows)
                throw "Row index out of range.";
            if(!(array instanceof Matrix)) array = Matrix.rowVector(array);
            if(array.columns !== this.columns)
                throw "Invalid row size";
            Asplice.call(this, index, 0, array[0].slice());
            this.rows += 1;
            return this;
        },
        /**
         * Swaps two rows
         * @param {number} row1 - First row index
         * @param {number} row2 - Second row index
         * @returns {this}
         */
        swapRows : function(row1, row2) {
            this.checkRowIndex(row1);
            this.checkRowIndex(row2);
            var temp = this[row1];
            this[row1] = this[row2];
            this[row2] = temp;
            return this;
        },
        /**
         * Returns a new column vector from the given index
         * @param {number} index - Column index
         * @returns {Matrix}
         */
        getColumn : function(index) {
            this.checkColumnIndex(index);
            var l = this.rows, column = new Array(l);
            for(var i = 0; i < l; i++) {
                column[i] = [this[i][index]];
            }
            return new Matrix(column);
        },
        /**
         * Sets a column at the given index
         * @param {number} index - Column index
         * @param {array|Matrix} Array or column vector
         * @returns {this}
         */
        setColumn : function(index, array) {
            this.checkColumnIndex(index);
            if(!(array instanceof Matrix)) array = Matrix.columnVector(array);
            var l = this.rows;
            if(array.rows !== l)
                throw "Invalid column size";
            for(var i = 0; i < l; i++) {
                this[i][index] = array[i][0];
            }
            return this;
        },
        /**
         * Removes a column from the given index
         * @param {number} index - Column index
         * @returns {this}
         */
        removeColumn : function(index) {
            this.checkColumnIndex(index);
            if(this.columns === 1)
                throw "A matrix cannot have less than one column";
            for(var i = 0, ii = this.rows; i < ii; i++) {
                this[i].splice(index,1);
            }
            this.columns -= 1;
            return this;
        },
        /**
         * Adds a column at the given index
         * @param {number} index - Column index
         * @param {array|Matrix} Array or column vector
         * @returns {this}
         */
        addColumn : function(index, array) {
            if(index < 0 || index > this.columns)
                throw "Column index out of range.";
            if(!(array instanceof Matrix)) array = Matrix.columnVector(array);
            var l = this.rows;
            if(array.rows !== l)
                throw "Invalid column size";
            for(var i = 0; i < l; i++) {
                this[i].splice(index, 0, array[i][0]);
            }
            this.columns += 1;
            return this;
        },
        /**
         * Swaps two columns
         * @param {number} column1 - First column index
         * @param {number} column2 - Second column index
         * @returns {this}
         */
        swapColumns : function(column1, column2) {
            this.checkRowIndex(column1);
            this.checkRowIndex(column2);
            var l = this.rows, temp, row;
            for(var i = 0; i < l; i++) {
                row = this[i];
                temp = row[column1];
                row[column1] = row[column2];
                row[column2] = temp;
            }
            return this;
        },
        /* Internal methods */
        checkRowVector : function(vector) {
            if(vector instanceof Matrix && vector.isRowVector())
                vector = vector.getRow(0);
            if(vector.length !== this.columns)
                throw "vector size must be the same as the number of columns";
            return vector;
        },
        checkColumnVector : function(vector) {
            if(vector instanceof Matrix && vector.isColumnVector())
                vector = vector.getColumn(0);
            if(vector.length !== this.rows)
                throw "vector size must be the same as the number of rows";
            return vector;
        },
        /**
         * Adds the values of a row vector to each row
         * @param {array|Matrix} vector - Array or row vector
         * @returns {this}
         */
        addRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(i, j){ this[i][j] += vector[j] });
        },
        /**
         * Substracts the values of a row vector from each row
         * @param {array|Matrix} vector - Array or row vector
         * @returns {this}
         */
        subRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(i, j){ this[i][j] -= vector[j] });
        },
        /**
         * Multiplies the values of a row vector with each row
         * @param {array|Matrix} vector - Array or row vector
         * @returns {this}
         */
        mulRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(i, j){ this[i][j] *= vector[j] });
        },
        /**
         * Divides the values of each row by the ones of a row vector
         * @param {array|Matrix} vector - Array or row vector
         * @returns {this}
         */
        divRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(i, j){ this[i][j] /= vector[j] });
        },
        /**
         * Adds the values of a column vector to each column
         * @param {array|Matrix} vector - Array or column vector
         * @returns {this}
         */
        addColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(i, j){ this[i][j] += vector[i] });
        },
        /**
         * Substracts the values of a column vector from each column
         * @param {array|Matrix} vector - Array or column vector
         * @returns {this}
         */
        subColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(i, j){ this[i][j] -= vector[i] });
        },
        /**
         * Multiplies the values of a column vector with each column
         * @param {array|Matrix} vector - Array or column vector
         * @returns {this}
         */
        mulColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(i, j){ this[i][j] *= vector[i] });
        },
        /**
         * Divides the values of each column by the ones of a column vector
         * @param {array|Matrix} vector - Array or column vector
         * @returns {this}
         */
        divColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(i, j){ this[i][j] /= vector[i] });
        },
        /**
         * Multiplies the values of a row with a scalar
         * @param {number} index - Row index
         * @param {number} value
         * @returns {this}
         */
        mulRow : function(index, value) {
            checkRowIndex(index);
            var i = 0, l = this.columns;
            for(; i < l; i++) {
                this[index][i] *= value;
            }
        },
        /**
         * Multiplies the values of a column with a scalar
         * @param {number} index - Column index
         * @param {number} value
         * @returns {this}
         */
        mulColumn : function(index, value) {
            checkColumnIndex(index);
            var i = 0, l = this.rows;
            for(; i < l; i++) {
                this[i][index] *= value;
            }
        },
        /**
         * Returns the maximum value of the whole matrix
         * @returns {number}
         */
        max : function() {
            var v = -Infinity;
            this.apply(function(i,j){
                if(this[i][j] > v)
                    v = this[i][j];
            });
            return v;
        },
        /**
         * Returns the index of the maximum value
         * @returns {object}
         */
        maxIndex : function() {
            var v = -Infinity;
            var index = {};
            this.apply(function(i,j){
                if(this[i][j] > v) {
                    v = this[i][j];
                    index.row = i;
                    index.column = j;
                }
            });
            return index;
        },
        /**
         * Returns the minimum value of the whole matrix
         * @returns {number}
         */
        min : function() {
            var v = Infinity;
            this.apply(function(i,j){
                if(this[i][j] < v)
                    v = this[i][j];
            });
            return v;
        },
        /**
         * Returns the index of the minimum value
         * @returns {object}
         */
        minIndex : function() {
            var v = Infinity;
            var index = {};
            this.apply(function(i,j){
                if(this[i][j] < v) {
                    v = this[i][j];
                    index.row = i;
                    index.column = j;
                }
            });
            return index;
        },
        /**
         * Returns a column vector containing the minimum values of each row
         * @returns {Matrix}
         */
        rowMins : function() {
            var mins = Matrix.empty(this.rows, 1);
            for(var i = 0, ii = this.rows; i < ii; i++) {
                mins[i][0] = this.getRow(i).min();
            }
            return mins;
        },
        /**
         * Returns an array containing the indices of the minimum values of each row
         * @returns {array}
         */
        rowMinsIndex : function() {
            var mins = new Array(this.rows);
            for(var i = 0, ii = this.rows; i < ii; i++) {
                mins[i] = this.getRow(i).minIndex();
            }
            return mins;
        },
        /**
         * Returns a column vector containing the maximum values of each row
         * @returns {Matrix}
         */
        rowMaxs : function() {
            var maxs = Matrix.empty(this.rows, 1);
            for(var i = 0, ii = this.rows; i < ii; i++) {
                maxs[i][0] = this.getRow(i).max();
            }
            return maxs;
        },
        /**
         * Returns an array containing the indices of the maximum values of each row
         * @returns {array}
         */
        rowMaxsIndex : function() {
            var maxs = new Array(this.rows);
            for(var i = 0, ii = this.rows; i < ii; i++) {
                maxs[i] = this.getRow(i).maxIndex();
            }
            return maxs;
        },
        /**
         * Returns a row vector containing the minimum values of each column
         * @returns {Matrix}
         */
        columnMins : function() {
            var mins = Matrix.empty(1, this.columns);
            for(var i = 0, ii = this.columns; i < ii; i++) {
                mins[0][i] = this.getColumn(i).min();
            }
            return mins;
        },
        /**
         * Returns an array containing the indices of the minimum values of each column
         * @returns {array}
         */
        columnMinsIndex : function() {
            var mins = new Array(this.columns);
            for(var i = 0, ii = this.columns; i < ii; i++) {
                mins[i] = this.getColumn(i).minIndex();
            }
            return mins;
        },
        /**
         * Returns a row vector containing the maximum values of each column
         * @returns {Matrix}
         */
        columnMaxs : function() {
            var maxs = Matrix.empty(1, this.columns);
            for(var i = 0, ii = this.columns; i < ii; i++) {
                maxs[0][i] = this.getColumn(i).max();
            }
            return maxs;
        },
        /**
         * Returns an array containing the indices of the maximum values of each column
         * @returns {array}
         */
        columnMaxsIndex : function() {
            var maxs = new Array(this.columns);
            for(var i = 0, ii = this.columns; i < ii; i++) {
                maxs[i] = this.getColumn(i).maxIndex();
            }
            return maxs;
        },
        /**
         * Returns an array containing the diagonal values of the matrix
         * @returns {array}
         */
        diag : function() {
            if(!this.isSquare())
                throw "Only square matrices have a diagonal.";
            var diag = new Array(this.rows);
            for(var i = 0, ii = this.rows; i < ii; i++) {
                diag[i] = this[i][i];
            }
            return diag;
        },
        /**
         * Returns a column vector containing the sum of the values of each row
         * @returns {Matrix}
         */
        rowSums : function() {
            if(this.columns === 1)
                return this.clone();
            var v = Matrix.zeros(this.rows, 1);
            this.apply(function(i, j){ v[i][0] += this[i][j]; });
            return v;
        },
        /**
         * Returns a column vector containing the mean of the values of each row
         * @returns {Matrix}
         */
        rowMeans : function() {
            return this.rowSums().div(this.columns);
        },
        /**
         * Returns a row vector containing the sum of the values of each column
         * @returns {Matrix}
         */
        columnSums : function() {
            if(this.rows === 1)
                return this.clone();
            var v = Matrix.zeros(1, this.columns);
            this.apply(function(i, j){ v[0][j] += this[i][j]; });
            return v;
        },
        /**
         * Returns a row vector containing the mean of the values of each column
         * @returns {Matrix}
         */
        columnMeans : function() {
            return this.columnSums().div(this.rows);
        },
        /**
         * Computes the cumulative sum of the matrix elements (in place, row by row)
         * @returns {this}
         */
        cumulativeSum : function() {
            var sum = 0;
            return this.apply(function(i, j){
                sum += this[i][j];
                this[i][j] = sum;
            });
        },
        /**
         * Computes the dot (or scalar) product between the vector and another
         * @param {Matrix} other vector
         * @returns {number}
         */
        dot : function(other) {
            if(this.size !== other.size)
                throw "Vectors do not have the same size.";
            var vector1 = this.to1DArray();
            var vector2 = other.to1DArray();
            var dot = 0, l = vector1.length;
            for(var i = 0; i < l; i++) {
                dot += vector1[i] * vector2[i];
            }
            return dot;
        },
        /**
         * Returns the sum of all elements of the matrix
         * @returns {number}
         */
        sum : function() {
            var v = 0;
            this.apply(function(i, j){ v += this[i][j]; });
            return v;
        },
        /**
         * Returns the mean of all elements of the matrix
         * @returns {number}
         */
        mean : function() {
            return this.sum()/this.size;
        },
        /**
         * Returns the product of all elements of the matrix
         * @returns {number}
         */
        prod : function() {
            var prod = 1;
            this.apply(function(i, j){ prod *= this[i][j]; });
            return prod;
        },
        /**
         * Returns the matrix product between this and other
         * @returns {Matrix}
         */
        mmul : function(other) {
            if(this.columns !== other.rows)
                throw "Number of columns of left matrix must be equal to number of rows of right matrix.";
            var ii = this.rows, jj = other.columns;
            var newMatrix = Matrix.empty(ii, jj);
            var rightVectors = new Array(jj);
            
            var i, j, vector1, vector2;
            for(j = 0; j < jj; j++)
                rightVectors[j] = other.getColumn(j).transpose();
            for( i = 0; i < ii; i++) {
                vector1 = this[i];
                for(j = 0; j < jj; j++) {
                    newMatrix[i][j] = Matrix.columnVector(vector1).dot(rightVectors[j]);
                }
            }
            return newMatrix;
        },
        /**
         * Sorts the rows (in place)
         * @param {function} compareFunction - usual Array.prototype.sort comparison function
         * @returns {this}
         */
        sortRows : function(compareFunction) {
            for(var i = 0, ii = this.rows; i < ii; i++) {
                this[i].sort(compareFunction);
            }
            return this;
        },
        /**
         * Sorts the columns (in place)
         * @param {function} compareFunction - usual Array.prototype.sort comparison function
         * @returns {this}
         */
        sortColumns : function(compareFunction) {
            for(var i = 0, ii = this.columns; i < ii; i++) {
                this.setColumn(i, this.getColumn(i).to1DArray().sort(compareFunction));
            }
            return this;
        },
        /**
         * Transposes the matrix and returns the result
         * @returns {Matrix}
         */
        transpose : function() {
            var result = Matrix.empty(this.columns, this.rows);
            this.apply(function(i, j){ result[j][i] = this[i][j]; });
            return result;
        },
        /**
         * Returns a subset of the matrix
         * @param {number} startRow - First row index
         * @param {number} endRow - Last row index
         * @param {number} startColumn - First column index
         * @param {number} endColumn - Last column index
         * @returns {Matrix}
         */
        subMatrix : function(startRow, endRow, startColumn, endColumn) {
            if ((startRow > endRow) || (startColumn > endColumn) ||  (startRow < 0) || (startRow >= this.rows) ||  (endRow < 0) || (endRow >= this.rows) ||  (startColumn < 0) || (startColumn >= this.columns) ||  (endColumn < 0) || (endColumn >= this.columns))
                throw "Argument out of range";
            var newMatrix = Matrix.empty(endRow - startRow + 1, endColumn - startColumn + 1);
            for (var i = startRow; i <= endRow; i++) {
                for (var j = startColumn; j <= endColumn; j++) {
                    newMatrix[i - startRow][j - startColumn] = this[i][j];
                }
            }
            return newMatrix;
        },
        /**
         * Returns a subset of the matrix based on an array of row indices
         * @param {array} r - Array containing the row indices
         * @param {number} startColumn - First column index
         * @param {number} endColumn - Last column index
         * @returns {Matrix}
         */
        subMatrixRow : function(r, startColumn, endColumn) {
            if ((startColumn > endColumn) || (startColumn < 0) || (startColumn >= this.columns) || (endColumn < 0) || (endColumn >= this.columns))
                throw "Argument out of range.";
            var l = r.length, rows = this.rows,
                X = Matrix.empty(l, endColumn - startColumn + 1);
            for (var i = 0; i < l; i++) {
                for (var j = startColumn; j <= endColumn; j++) {
                    if ((r[i] < 0) || (r[i] >= rows))
                        throw "Argument out of range."; 
                    X[i][j - startColumn] = this[r[i]][j];
                }
            }
            return X;
        },
        /**
         * Returns the trace of the matrix (sum of the diagonal elements)
         * @returns {number}
         */
        trace : function() {
            if(!this.isSquare())
                throw "The matrix is not square";
            var trace = 0, i = 0, l = this.rows;
            for(; i < l; i++) {
                trace += this[i][i];
            }
            return trace;
        },
        inverse : function() {
            return this.solve(Matrix.eye(this.rows));
        },
        solve : function(rightHandSide) {
            var result, self = this;
            require(["./decompositions"], function (DC) {
                result = self.isSquare() ? new DC.LuDecomposition(self).solve(rightHandSide) : new DC.QrDecomposition(self).solve(rightHandSide);
            });
            return result;
        }
    };
    
    return Matrix;

});