const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const studentController = {
  index: async (req, res) => {
    try {
      const allStudents = await prisma.students.findMany();
      res.json(allStudents);
    } catch (error) {
      console.error("Error retrieving students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  store: async (req, res) => {
    try {
      const newStudent = await prisma.students.create({ data: req.body });
      res.json(newStudent);
    } catch (error) {
      console.error("Error retrieving students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const name = req.body.name;

      const updatedStudent = await prisma.students.update({
        where: { id: parseInt(id) },
        data: { name: name },
      });
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error retrieving students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  destroy: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedStudent = await prisma.students.delete({
        where: { id: parseInt(id) },
      });
      res.json(deletedStudent);
    } catch (error) {
      console.error("Error retrieving students:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = studentController;
