export class LoginDto {
  username: string;
  password: string;
}

export class LoginResponseDto {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    tenantId: number | null;
    role: string;
  };
}
