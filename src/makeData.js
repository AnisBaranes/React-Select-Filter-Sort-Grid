import namor from "namor";
import axios from "axios";

const range = (len) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};
const newPerson = () => {
  return {
    id: Math.floor(Math.random() * 300),
    guid: "{00000000-0000-0000-0000-00000000000}",
    firstName: namor.generate({ words: 1, numbers: 0 }),
    lastName: namor.generate({ words: 1, numbers: 0 }),
    birthday: getDate(new Date()),
    parent1: namor.generate({ words: 1, numbers: 0 }),
    parent2: namor.generate({ words: 1, numbers: 0 }),
    address: "Tel Aviv",
    educationType: "special",
    registration: "registration",
    instatuation: namor.generate({ words: 1, numbers: 0 }),
    class: namor.generate({ words: 1, numbers: 0 }),
    exitDate: getDate(new Date()),
    exitReason: namor.generate({ words: 1, numbers: 0 }),
    registrationNextYear: "registration",
    instatuationNextYear: namor.generate({ words: 1, numbers: 0 }),
    classNextYear: namor.generate({ words: 1, numbers: 0 }),
    link: "CRM LINK"
  };
};

function getDate(dateTime) {
  return `${dateTime.getDate()}-${
    dateTime.getMonth() + 1
  }-${dateTime.getFullYear()}`;
}

function componentDidMount() {
  axios.get(`https://jsonplaceholder.typicode.com/users`).then((res) => {
    const persons = res.data;
    //this.setState({ persons });
    console.log(persons);
  });
}

export default function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth];
    return range(len).map((d) => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined
      };
    });
  };
  componentDidMount();
  return makeDataLevel();
}
