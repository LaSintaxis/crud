const { default: mongoose } = require('mongoose');
const mongoose = require('mongoose');
const nodemon = require('nodemon');

const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    require: [true, 'El nombre es obligatorio'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    require: [true, 'La descripcion es obligatoria'],
    trim: true
  }
}, {
  trimestamps: true,
  versionKey: false
});

//eliminar el indice problematico si existe 
categorySchema.pre('save', async function (next) {
  try {
    const collection = this.constructor.collection;
    const indice = await collection.indexes();

    //Buscar y eliminar indice problematico con nombre "nombre_1"
    const problematicIndex = indexes.find(indexes.name === 'nombre_1');
    if (problematicIndex) {
      await collection.dropIndex('nombre_1');
    }
  } catch(error) {
    //ignorar si el indice no existe
    if (!error.message.includes('Index not found')) {
      return next(err);
    }
  }
  next();
})

// Crear nuevo indice correcto
categorySchema.index({name:1}, {
  unique: true,
  name: 'name_1' //Nombre explicito para el indice 
});

module.exports = mongoose.model('Category', categorySchema);