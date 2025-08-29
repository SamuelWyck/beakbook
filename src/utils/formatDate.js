import moment from "moment";



function formatDate(date) {
    const formatStr = "M/D/yyyy h:mm a";

    date = new Date(date).getTime();
    const correctedDate = moment(date);
    return correctedDate.format(formatStr);
};



export default formatDate;