import { useMutation } from "@tanstack/react-query";
import apiClient from "../api-client";
import { SignInDto } from "@/types";

const authApi = {
  login: (body: SignInDto) => apiClient.post("auth/login/", body),
};

export function useLogin() {
  return useMutation({
    mutationFn: (body: SignInDto) => authApi.login(body),
  });
}
