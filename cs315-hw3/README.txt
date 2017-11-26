/**********************************************************************
 *  README.txt
 *  CS315 - Matrix transformations
 **********************************************************************/

/**********************************************************************
* What is your name?
***********************************************************************/

Elizabeth Zweizig


/**********************************************************************
* What browser and operating system did you test your program with?
***********************************************************************/

Mac ios, chrome for testing, safari for looking at the lecture notes.

/**********************************************************************
* Answer any questions here that you were asked to answer on the
* assignment's web page.
***********************************************************************/

Exercise 1: Combining Matrix Transformations

The order of multiplying matrices does matter and is important.
Translating first, the multiplication maintains the translation in the fourth column
of the resulting matrix, this is what we want. For rotation and translation,
the translation takes a linear combination of the leftmost three columns, this results
in incorrect translation values (e.g., if we were translating along the axes by a, b, and c
(corresponding to the x, y, and z axes), and rotating around the axes by x, y, and z;
instead of a translation by a, we would have a translation of
a*cos(y)*cos(z) - b*cos(y)*sin(z) + c*sin(y).).

Exercise 3: Mirror Transforms

Materials not declared double sided will only be visible on one side. In the canvasHeight
of the knight we will not see the side of the knight closest to you.

A solution to this problem would be to invert the orientation of the knight.

/**********************************************************************
* Approximately how many hours did you spend working on this assignment?
***********************************************************************/

3-4 hours

/**********************************************************************
 * Describe any problems you encountered in this assignment.
 **********************************************************************/

The multiaxis transformation. It can't be done purely by mirroring across multiple axes.

/**********************************************************************
 * If you did any extra credit on this assignment, include relevant
 * links and comments below.
 **********************************************************************/

N/A
