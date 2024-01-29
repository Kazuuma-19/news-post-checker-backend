const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// students
router.get("/", async (req, res) => {
  const allStudents = await prisma.students.findMany();
  res.json(allStudents);
});

router.post("/", async (req, res) => {
  const newStudent = await prisma.students.create({ data: req.body });
  res.json(newStudent);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  const updatedStudent = await prisma.students.update({
    where: { id: parseInt(id) },
    data: { name: name },
  });
  res.json(updatedStudent);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const deletedStudent = await prisma.students.delete({
    where: { id: parseInt(id) },
  });
  res.json(deletedStudent);
});
module.exports = router;
