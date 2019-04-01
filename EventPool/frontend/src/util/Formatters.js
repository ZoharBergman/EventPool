/**
 * Created by Zohar on 01/04/2019.
 */
const dateFormatter = (dateInMilliSecs) => {
  const date = new Date(dateInMilliSecs);

  const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()} at ${date.getHours() < 10 ? "0" + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}`;
};

export default {
    dateFormatter: dateFormatter
};