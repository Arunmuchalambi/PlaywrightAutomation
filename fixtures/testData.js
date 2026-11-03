const { faker } = require('@faker-js/faker');

function buildUserFormData() {
  // Respect maxlength on the practice form: name=15, email=25, phone=10
  return {
    name: faker.string.alpha({ length: 12 }),
    email: faker.internet.email().toLowerCase().slice(0, 25),
    phone: faker.string.numeric(10),
    address: faker.location.streetAddress({ useFullAddress: true }),
    gender: 'male',
    days: ['monday', 'wednesday', 'friday'],
    country: 'canada',
    colors: ['blue', 'green'],
    animals: ['cat', 'dog'],
  };
}

const STATIC_BOOKS = [
  { bookName: 'Learn Selenium', author: 'Amit', subject: 'Selenium', price: '300' },
  { bookName: 'Learn Java', author: 'Mukesh', subject: 'Java', price: '500' },
  { bookName: 'Learn JS', author: 'Animesh', subject: 'Javascript', price: '300' },
  { bookName: 'Master In Selenium', author: 'Mukesh', subject: 'Selenium', price: '3000' },
  { bookName: 'Master In Java', author: 'Amod', subject: 'JAVA', price: '2000' },
  { bookName: 'Master In JS', author: 'Amit', subject: 'Javascript', price: '1000' },
];

const NAV_LINKS = ['Home', 'Udemy Courses', 'Online Trainings', 'Blog', 'PlaywrightPractice'];

const BROKEN_LINK_CODES = [400, 401, 403, 404, 408, 500, 502, 503];

const MOBILE_LABELS = ['Samsung', 'Real Me', 'Moto'];

module.exports = {
  buildUserFormData,
  STATIC_BOOKS,
  NAV_LINKS,
  BROKEN_LINK_CODES,
  MOBILE_LABELS,
};
