const User = require('./User');
const Item = require('./Item');
const Category = require('./Category');
const ItemCategory = require('./ItemCategory');
const Group = require('./Group');
const Message = require('./Message');

User.hasMany(Item);
Item.belongsTo(User);

User.hasMany(Category);
Category.belongsTo(User);

Item.belongsToMany(Category, { through: ItemCategory });
Category.belongsToMany(Item, { through: ItemCategory });

User.belongsToMany(User, { as: 'friend', through: Group });

User.hasMany(Message);
Message.belongsTo(User);
