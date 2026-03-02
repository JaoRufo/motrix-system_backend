import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ordemService } from './ordens.service';
import { validationResult } from 'express-validator';
import { generateOrdemPDF } from '../../utils/pdf';
import { pool } from '../../config/database';

export const ordemController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const ordens = await ordemService.getAll();
      res.json(ordens);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const ordem = await ordemService.getById(id);
      res.json(ordem);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async getByPlaca(req: AuthRequest, res: Response) {
    try {
      const placa = req.params.placa!;
      const ordens = await ordemService.getByPlaca(placa);
      res.json(ordens);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const ordem = await ordemService.create(req.body);
      res.status(201).json(ordem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id!);
      const ordem = await ordemService.update(id, req.body);
      res.json(ordem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const result = await ordemService.delete(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async downloadPDF(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id!);
      const ordem = await ordemService.getById(id);
      
      const clienteResult = await pool.query(
        'SELECT nome, telefone, cpf FROM clientes WHERE id = $1', 
        [ordem.cliente_id]
      );
      
      const veiculoResult = await pool.query(
        'SELECT modelo FROM veiculos WHERE id = $1', 
        [ordem.veiculo_id]
      );
      
      const mecanicoResult = ordem.mecanico_id 
        ? await pool.query('SELECT nome FROM usuarios WHERE id = $1', [ordem.mecanico_id])
        : null;
      
      const oficinaResult = await pool.query(
        'SELECT nome, cnpj, telefone, endereco FROM oficinas LIMIT 1'
      );
      
      const ordemCompleta = {
        ...ordem,
        cliente_nome: clienteResult.rows[0]?.nome,
        cliente_telefone: clienteResult.rows[0]?.telefone,
        cliente_cpf: clienteResult.rows[0]?.cpf,
        veiculo_modelo: veiculoResult.rows[0]?.modelo,
        mecanico_nome: mecanicoResult?.rows[0]?.nome,
        oficina_nome: oficinaResult.rows[0]?.nome,
        oficina_cnpj: oficinaResult.rows[0]?.cnpj,
        oficina_telefone: oficinaResult.rows[0]?.telefone,
        oficina_endereco: oficinaResult.rows[0]?.endereco
      };

      generateOrdemPDF(ordemCompleta, res);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
};
