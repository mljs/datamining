define(function(){
    
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
        checkMultiply : function(otherMatrix) {
            if(this.columns !== otherMatrix.rows)
                throw "Number of columns of left matrix must be equal to number of rows of right matrix.";
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
        add : function(value) {
            if(typeof value === "number")
                return this.addS(value);
            if(value instanceof Matrix)
                return this.addM(value);
        },
        addS : function(value) {
            return this.apply(function (mat, i, j) { mat[i][j] += value; });
        },
        addM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (mat, i, j) { mat[i][j] += value[i][j]; });
        },
        sub : function(value) {
            if(typeof value === "number")
                return this.subS(value);
            if(value instanceof Matrix)
                return this.subM(value);
        },
        subS : function(value) {
            return this.apply(function (mat, i, j) { mat[i][j] -= value; });
        },
        subM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (mat, i, j) { mat[i][j] += value[i][j]; });
        },
        mul : function(value) {
            if(typeof value === "number")
                return this.mulS(value);
            if(value instanceof Matrix)
                return this.mulM(value);
        },
        mulS : function(value) {
            return this.apply(function (mat, i, j) { mat[i][j] *= value; });
        },
        mulM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (mat, i, j) { mat[i][j] *= value[i][j]; });
        },
        div : function(value) {
            if(typeof value === "number")
                return this.divS(value);
            if(value instanceof Matrix)
                return this.divM(value);
        },
        divS : function(value) {
            return this.apply(function (mat, i, j) { mat[i][j] /= value; });
        },
        divM : function(value) {
            this.checkDimensions(value);
            return this.apply(function (mat, i, j) { mat[i][j] /= value[i][j]; });
        },
        getRow : function(index) {
            this.checkRowIndex(index);
            return new Matrix([this[index]]);
        },
        setRow : function(index, array) {
            this.checkRowIndex(index);
            if(!(array instanceof Matrix)) array = Matrix.rowVector(array);
            if(array.columns !== this.columns)
                throw "Invalid row size";
            this[index] = array[0];
            return this;
        },
        removeRow : function(index) {
            this.checkRowIndex(index);
            if(this.rows===1)
                throw "A matrix cannot have less than one row";
            this.splice(index,1);
            this.rows -= 1;
            return this;
        },
        addRow : function(index, array) {
            if(index < 0 || index > this.rows)
                throw "Row index out of range.";
            if(!(array instanceof Matrix)) array = Matrix.rowVector(array);
            if(array.columns !== this.columns)
                throw "Invalid row size";
            this.splice(index, 0, array[0]);
            this.rows += 1;
            return this;
        },
        swapRows : function(row1, row2) {
            this.checkRowIndex(row1);
            this.checkRowIndex(row2);
            var temp = this[row1];
            this[row1]=this[row2];
            this[row2]=temp;
            return this;
        },
        getColumn : function(index) {
            var column, i;
            this.checkColumnIndex(index);
            column = new Array(this.rows);
            for(i = 0; i<this.rows; i++) {
                column[i] = [this[i][index]];
            }
            return new Matrix(column);
        },
        setColumn : function(index, array) {
            this.checkColumnIndex(index);
            if(!(array instanceof Matrix)) array = Matrix.columnVector(array);
            if(array.rows !== this.rows)
                throw "Invalid column size";
            for(var i=0; i<this.rows; i++) {
                this[i][index] = array[i][0];
            }
            return this;
        },
        removeColumn : function(index) {
            this.checkColumnIndex(index);
            if(this.columns===1)
                throw "A matrix cannot have less than one column";
            for(var i = 0, ii = this.rows; i < ii; i++) {
                this[i].splice(index,1);
            }
            this.columns -= 1;
            return this;
        },
        addColumn : function(index, array) {
            if(index < 0 || index > this.columns)
                throw "Column index out of range.";
            if(!(array instanceof Matrix)) array = Matrix.columnVector(array);
            if(array.rows !== this.rows)
                throw "Invalid column size";
            for(var i=0; i<this.rows; i++) {
                this[i].splice(index, 0, array[i][0]);
            }
            this.columns += 1;
            return this;
        },
        swapColumns : function(column1, column2) {
            this.checkRowIndex(column1);
            this.checkRowIndex(column2);
            var l=this.rows, temp, row;
            for(var i=0; i<l; i++) {
                row = this[i];
                temp = row[column1];
                row[column1]=row[column2];
                row[column2]=temp;
            }
            return this;
        },
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
        addRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] += vector[j] });
        },
        subRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] -= vector[j] });
        },
        mulRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] *= vector[j] });
        },
        divRowVector : function(vector) {
            vector = this.checkRowvector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] /= vector[j] });
        },
        addColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] += vector[i] });
        },
        subColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] -= vector[i] });
        },
        mulColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] *= vector[i] });
        },
        divColumnVector : function(vector) {
            vector = this.checkColumnVector(vector);
            return this.apply(function(mat, i, j){ mat[i][j] /= vector[i] });
        },
        mulRow : function(index, value) {
            checkRowIndex(index);
            for(var i=0; i<this.columns; i++) {
                this[index][i] *= value;
            }
        },
        mulColumn : function(index, value) {
            checkColumnIndex(index);
            for(var i=0; i<this.rows; i++) {
                this[i][index] *= value;
            }
        },
        max : function() {
            var v = -Infinity;
            this.apply(function(mat,i,j){
                if(mat[i][j] > v)
                    v = mat[i][j];
            });
            return v;
        },
        maxIndex : function() {
            var v = -Infinity;
            var index = {};
            this.apply(function(mat,i,j){
                if(mat[i][j] > v) {
                    v = mat[i][j];
                    index.row=i;
                    index.column=j;
                }
            });
            return index;
        },
        min : function() {
            var v = Infinity;
            this.apply(function(mat,i,j){
                if(mat[i][j] < v)
                    v = mat[i][j];
            });
            return v;
        },
        minIndex : function() {
            var v = Infinity;
            var index = {};
            this.apply(function(mat,i,j){
                if(mat[i][j] < v) {
                    v = mat[i][j];
                    index.row=i;
                    index.column=j;
                }
            });
            return index;
        },
        rowMins : function() {
            var mins = Matrix.empty(this.rows, 1);
            for(var i=0; i<this.rows; i++) {
                mins[i][0] = this.getRow(i).min();
            }
            return mins;
        },
        rowMinsIndex : function() {
            var mins = new Array(this.rows);
            for(var i=0; i<this.rows; i++) {
                mins[i] = this.getRow(i).minIndex();
            }
            return mins;
        },
        rowMaxs : function() {
            var maxs = Matrix.empty(this.rows, 1);
            for(var i=0; i<this.rows; i++) {
                maxs[i][0] = this.getRow(i).max();
            }
            return maxs;
        },
        rowMaxsIndex : function() {
            var maxs = new Array(this.rows);
            for(var i=0; i<this.rows; i++) {
                maxs[i] = this.getRow(i).maxIndex();
            }
            return maxs;
        },
        columnMins : function() {
            var mins = Matrix.empty(1, this.columns);
            for(var i=0; i<this.columns; i++) {
                mins[0][i] = this.getColumn(i).min();
            }
            return mins;
        },
        columnMinsIndex : function() {
            var mins = new Array(this.columns);
            for(var i=0; i<this.columns; i++) {
                mins[i] = this.getColumn(i).minIndex();
            }
            return mins;
        },
        columnMaxs : function() {
            var maxs = Matrix.empty(1, this.columns);
            for(var i=0; i<this.columns; i++) {
                maxs[0][i] = this.getColumn(i).max();
            }
            return maxs;
        },
        columnMaxsIndex : function() {
            var maxs = new Array(this.columns);
            for(var i=0; i<this.columns; i++) {
                maxs[i] = this.getColumn(i).maxIndex();
            }
            return maxs;
        },
        diag : function() {
            if(!this.isSquare())
                throw "Only square matrices have a diagonal.";
            var diag = new Array(this.rows);
            for(var i=0; i<this.rows; i++) {
                diag[i] = this[i][i];
            }
            return diag;
        },
        columnSums : function() {
            if(this.rows === 1)
                return this.clone();
            var v = Matrix.zeros(1, this.columns);
            this.apply(function(mat,i,j){ v[0][j]+=mat[i][j]; });
            return v;
        },
        columnMeans : function() {
            return this.columnSums().div(this.rows);
        },
        rowSums : function() {
            if(this.columns === 1)
                return this.clone();
            var v = Matrix.zeros(this.rows, 1);
            this.apply(function(mat,i,j){ v[i][0]+=mat[i][j]; });
            return v;
        },
        rowMeans : function() {
            return this.rowSums().div(this.columns);
        },
        cumulativeSum : function() {
            var sum = 0;
            return this.apply(function(mat, i, j){
                sum+=mat[i][j];
                mat[i][j]=sum;
            });
        },
        dot : function(other) {
            if(!this.isVector() || !other.isVector())
                throw "Dot product only applicable to vectors";
            var vector1 = this.to1DArray();
            var vector2 = other.to1DArray();
            if(vector1.length !== vector2.length)
                throw "Vectors do not have the same size";
            var dot = 0, l=vector1.length;
            for(var i=0; i<l; i++) {
                dot+= vector1[i]*vector2[i];
            }
            return dot;
        },
        sum : function() {
            var v = 0;
            this.apply(function(mat, i, j){ v+=mat[i][j]; });
            return v;
        },
        mean : function() {
            return this.sum()/(this.rows*this.columns);
        },
        mmul : function(other) {
            this.checkMultiply(other);
            var newMatrix = Matrix.empty(this.rows, other.columns);
            var i, j, vector1, vector2;
            for(i=0; i<newMatrix.rows; i++) {
                vector1 = this.getRow(i);
                for(j=0; j<newMatrix.columns; j++) {
                    vector2 = other.getColumn(j);
                    newMatrix[i][j] = vector1.dot(vector2);
                }
            }
            return newMatrix;
        },
        prod : function() {
            var prod = 1;
            this.apply(function(mat, i, j){ prod *= mat[i][j]; });
            return prod;
        },
        sortRows : function() {
            for(var i=0; i<this.rows; i++) {
                this[i].sort();
            }
            return this;
        },
        sortColumns : function() {
            for(var i=0; i<this.columns; i++) {
                this.setColumn(i, this.getColumn(i).to1DArray().sort());
            }
            return this;
        },
        transpose : function() {
            var result = Matrix.empty(this.columns, this.rows);
            this.apply(function(mat, i, j){ result[j][i] = mat[i][j]; });
            return result;
        },
        subMatrix : function(startRow, endRow, startColumn, endColumn) {
            if ((startRow > endRow) || (startColumn > endColumn) ||  (startRow < 0) || (startRow >= this.rows) ||  (endRow < 0) || (endRow >= this.rows) ||  (startColumn < 0) || (startColumn >= this.columns) ||  (endColumn < 0) || (endColumn >= this.columns)) {
                throw "Argument out of range";
            }
            var newMatrix = Matrix.empty(endRow - startRow + 1, endColumn - startColumn + 1);
            for (var i = startRow; i <= endRow; i++) {
                for (var j = startColumn; j <= endColumn; j++) {
                    newMatrix[i - startRow][j - startColumn] = this[i][j];
                }
            }
            return newMatrix;
        },
        subMatrixRow : function(r, j0, j1) {
            if ((j0 > j1) || (j0 < 0) || (j0 >= this.columns) || (j1 < 0) || (j1 >= this.columns))
                throw "Argument out of range.";
            var X = Matrix.empty(r.length, j1-j0+1);
            for (var i = 0; i < r.length; i++) {
                for (var j = j0; j <= j1; j++) {
                    if ((r[i] < 0) || (r[i] >= this.rows))
                        throw "Argument out of range."; 
                    X[i][j - j0] = this[r[i]][j];
                }
            }
            return X;
        },
        // Sum of the diagonal elements
        trace : function() {
            if(!this.isSquare)
                throw "The matrix is not square";
            var trace = 0;
            for(var i=0; i<this.rows; i++) {
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
        },
        get size() {
            return this.rows * this.columns;
        }
    };
    
    Matrix.prototype.splice = Array.prototype.splice;
    
    return Matrix;

});