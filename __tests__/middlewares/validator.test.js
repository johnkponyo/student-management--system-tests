const { validationResult } = require('express-validator');
const { validate } = require('../../middlewares/validatorMiddleware');

jest.mock('express-validator');

describe('Tests for validation middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {}; 
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });


  it('should return 400 if there are validation errors', async () => {
    // Simulating validation errors
    const mockErrors = { isEmpty: jest.fn().mockReturnValue(false), array: jest.fn().mockReturnValue([{ msg: 'Error message' }]) };
    validationResult.mockReturnValue(mockErrors);

    await validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Error message' }] });
  });

  it('should call next() if there are no validation errors', async () => {
    // Simulating no validation errors
    const mockErrors = { isEmpty: jest.fn().mockReturnValue(true), array: jest.fn().mockReturnValue([]) };
    validationResult.mockReturnValue(mockErrors);

    await validate(req, res, next);

    expect(next).toHaveBeenCalled();  //Calls next() if if there are no errors
  })
})
