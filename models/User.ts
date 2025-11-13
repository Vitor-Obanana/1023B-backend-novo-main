// models/User.ts
import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // senha original (antes do hash)
  role: "ADMIN" | "USER";
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // armazenaremos o hash aqui
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
});

// Antes de salvar, gerar o hash da senha se ela foi modificada
userSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// Método de comparação de senha
userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default model<IUser>("User", userSchema);
