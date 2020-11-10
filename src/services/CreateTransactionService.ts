import { getCustomRepository, getRepository } from 'typeorm'; // USAR REP/ USAR MODEL
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryepository = getRepository(Category); // criar um repositório através da model

    const { total } = await transactionsRepository.getBalance();

    if (type == 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    // Verificar se a categoria já existe
    let transactionCategory = await categoryepository.findOne({
      where: {
        title: category,
      },
    });
    // Não existe? Crie ela
    if (!transactionCategory) {
      transactionCategory = categoryepository.create({
        title: category,
      });

      await categoryepository.save(transactionCategory);
    }

    // Existe? Buscar ela no banco de dados e usar o id que foi retornado

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
