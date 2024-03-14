const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const studentController = {
  index: async (req, res) => {
    try {
      const allStudents = await prisma.student.findMany({
        orderBy: [{ grade: "desc" }, { name: "asc" }],
      });
      res.json(allStudents);
    } catch (error) {
      console.error("Error retrieving student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  store: async (req, res) => {
    try {
      const newStudent = await prisma.student.create({ data: req.body });
      res.json(newStudent);
    } catch (error) {
      console.error("Error retrieving student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, grade, active } = req.body;

      const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: {
          name: name,
          grade: grade,
          active: active,
        },
      });
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error retrieving student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  destroy: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedStudent = await prisma.student.delete({
        where: { id: parseInt(id) },
      });
      res.json(deletedStudent);
    } catch (error) {
      console.error("Error retrieving student:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = studentController;
