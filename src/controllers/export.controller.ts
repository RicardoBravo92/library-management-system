import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import prisma from '../config/prisma';

export const exportData = async (req: Request, res: Response) => {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
    });
    const books = await prisma.book.findMany({
      include: { author: true },
      orderBy: { title: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    
    // Authors Sheet
    const authorSheet = workbook.addWorksheet('Authors');
    authorSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Nationality', key: 'nationality', width: 20 },
      { header: 'Book Count', key: 'bookCount', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];
    
    // Estilizar encabezados
    authorSheet.getRow(1).font = { bold: true };
    authorSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    authorSheet.addRows(
      authors.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString().split('T')[0],
      }))
    );

    // Books Sheet
    const bookSheet = workbook.addWorksheet('Books');
    bookSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Genre', key: 'genre', width: 20 },
      { header: 'Author', key: 'authorName', width: 30 },
      { header: 'Author ID', key: 'authorId', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];
    
    // Estilizar encabezados
    bookSheet.getRow(1).font = { bold: true };
    bookSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    bookSheet.addRows(
      books.map((b) => ({
        id: b.id,
        title: b.title,
        genre: b.genre || '',
        authorName: b.author.name,
        authorId: b.authorId,
        createdAt: b.createdAt.toISOString().split('T')[0],
      }))
    );

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `library_export_${timestamp}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      error: 'Error generating export file',
      message: error.message,
    });
  }
};
