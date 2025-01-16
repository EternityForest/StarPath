//  Apache-2.0 license
// AI converted from 
// https://github.com/gregory-halverson/ayanamsa/blob/main/ayanamsa.py


const PRECESSION_RATE = 50.290966; // arcseconds/year

interface AyanamsaMethod {
  [key: string]: Date;
}

const epochs: AyanamsaMethod = {
  "lahiri": new Date(285, 0, 1),
  'fagan-bradley': new Date(221, 0, 1),
  "krishnamurti": new Date(291, 0, 1),
  "raman": new Date(397, 0, 1),
};

function calculateAyanamsa(date: Date, method: string = 'Lahiri'): number {
  /**
   * Calculate Ayanamsa based on the chosen method.
   *
   * Parameters:
   * - date (Date): The date for which to calculate Ayanamsa.
   * - method (string): The Ayanamsa method to use. Options: "Lahiri", "Fagan-Bradley", "Krishnamurti", "Raman".
   *
   * Returns:
   * - number: The Ayanamsa value in degrees.
   */
  if (!(method in epochs)) {
    throw new Error(`Invalid method: ${method}. Choose from ${Object.keys(epochs)}`);
  }

  const epochDate = epochs[method];
  const elapsedYears = (date.getTime() - epochDate.getTime()) / (365.25 * 24 * 3600 * 1000);

  const ayanamsaArcseconds = elapsedYears * PRECESSION_RATE;
  const ayanamsaDegrees = ayanamsaArcseconds / 3600;
  return Math.round(ayanamsaDegrees * 1000000) / 1000000;
}

export { calculateAyanamsa}