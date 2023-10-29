type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message?: string;
  };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
