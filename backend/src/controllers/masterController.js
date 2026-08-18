const masterService = require('../services/masterService');
const asyncHandler = require('../utils/asyncHandler');

class MasterController {
  // Services
  getAllServices = asyncHandler(async (req, res) => {
    const services = await masterService.getAllServices();
    res.status(200).json(services);
  });

  getServiceById = asyncHandler(async (req, res) => {
    const service = await masterService.getServiceById(req.params.id);
    res.status(200).json(service);
  });

  createService = asyncHandler(async (req, res) => {
    const created = await masterService.createService(req.body);
    res.status(201).json(created);
  });

  updateService = asyncHandler(async (req, res) => {
    const updated = await masterService.updateService(req.params.id, req.body);
    res.status(200).json(updated);
  });

  deleteService = asyncHandler(async (req, res) => {
    await masterService.deleteService(req.params.id);
    res.status(204).send();
  });

  // Motor Brands
  getAllBrands = asyncHandler(async (req, res) => {
    const brands = await masterService.getAllBrands();
    res.status(200).json(brands);
  });

  createBrand = asyncHandler(async (req, res) => {
    const created = await masterService.createBrand(req.body);
    res.status(201).json(created);
  });

  updateBrand = asyncHandler(async (req, res) => {
    const updated = await masterService.updateBrand(req.params.id, req.body);
    res.status(200).json(updated);
  });

  deleteBrand = asyncHandler(async (req, res) => {
    await masterService.deleteBrand(req.params.id);
    res.status(204).send();
  });

  // Motor Types
  getTypesByBrandId = asyncHandler(async (req, res) => {
    const types = await masterService.getTypesByBrandId(req.query.brandId);
    res.status(200).json(types);
  });

  createType = asyncHandler(async (req, res) => {
    const created = await masterService.createType(req.body);
    res.status(201).json(created);
  });

  updateType = asyncHandler(async (req, res) => {
    const updated = await masterService.updateType(req.params.id, req.body);
    res.status(200).json(updated);
  });

  deleteType = asyncHandler(async (req, res) => {
    await masterService.deleteType(req.params.id);
    res.status(204).send();
  });

  // Engine Capacities
  getAllCapacities = asyncHandler(async (req, res) => {
    const capacities = await masterService.getAllCapacities();
    res.status(200).json(capacities);
  });

  createCapacity = asyncHandler(async (req, res) => {
    const created = await masterService.createCapacity(req.body);
    res.status(201).json(created);
  });

  updateCapacity = asyncHandler(async (req, res) => {
    const updated = await masterService.updateCapacity(req.params.id, req.body);
    res.status(200).json(updated);
  });

  deleteCapacity = asyncHandler(async (req, res) => {
    await masterService.deleteCapacity(req.params.id);
    res.status(204).send();
  });

  // Suppliers
  getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await masterService.getAllSuppliers();
    res.status(200).json(suppliers);
  });

  createSupplier = asyncHandler(async (req, res) => {
    const created = await masterService.createSupplier(req.body);
    res.status(201).json(created);
  });

  updateSupplier = asyncHandler(async (req, res) => {
    const updated = await masterService.updateSupplier(req.params.id, req.body);
    res.status(200).json(updated);
  });

  deleteSupplier = asyncHandler(async (req, res) => {
    await masterService.deleteSupplier(req.params.id);
    res.status(204).send();
  });

  // Spareparts
  getAllSpareparts = asyncHandler(async (req, res) => {
    const spareparts = await masterService.getAllSpareparts();
    res.status(200).json(spareparts);
  });

  getSparepartById = asyncHandler(async (req, res) => {
    const sparepart = await masterService.getSparepartById(req.params.id);
    res.status(200).json(sparepart);
  });

  createSparepart = asyncHandler(async (req, res) => {
    const created = await masterService.createSparepart(req.body);
    res.status(201).json(created);
  });

  updateSparepart = asyncHandler(async (req, res) => {
    const updated = await masterService.updateSparepart(req.params.id, req.body);
    res.status(200).json(updated);
  });

  deleteSparepart = asyncHandler(async (req, res) => {
    await masterService.deleteSparepart(req.params.id);
    res.status(204).send();
  });
}

module.exports = new MasterController();
