import authAndGetCategories from './get-categories-test.js';
import authAndEditCategory from './edit-category-test.js';
import authAndCreateItem from './create-item-test.js';
import authAndUpdateProfile from './update-user-test.js';

export default function () {
  authAndGetCategories();
  authAndEditCategory();
  authAndCreateItem();
  authAndUpdateProfile();
}
