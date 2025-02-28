module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Pdfs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Ensure the Users table exists
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      pdf_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      extracted_json: {
        type: Sequelize.JSONB, // JSONB is preferred for PostgreSQL
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Pdfs");
  }
};
