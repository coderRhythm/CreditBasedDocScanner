module.exports = (sequelize, DataTypes) => {
    const Pdf = sequelize.define("Pdf", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        }
      },
      pdf_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      extracted_json: {
        type: DataTypes.JSONB,
        allowNull: false
      }
    });
  
    Pdf.associate = function (models) {
      Pdf.belongsTo(models.User, { foreignKey: "user_id" });
    };
  
    return Pdf;
  };
  