export type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

export const successResponse = <TData>(
  message: string,
  data: TData
): ApiSuccessResponse<TData> => ({
  success: true,
  message,
  data
});

export const errorResponse = (message: string, errors?: unknown): ApiErrorResponse => ({
  success: false,
  message,
  ...(errors === undefined ? {} : { errors })
});
