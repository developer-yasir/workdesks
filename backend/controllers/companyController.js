import Company from '../models/Company.js';
import CompanyRelationship from '../models/CompanyRelationship.js';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Super Admin)
export const getCompanies = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { domain: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.isActive = status === 'active';
        }

        const skip = (page - 1) * limit;

        const companies = await Company.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Company.countDocuments(query);

        // Get user count for each company
        const companiesWithStats = await Promise.all(companies.map(async (company) => {
            const userCount = await User.countDocuments({ companyId: company._id });
            const ticketCount = await Ticket.countDocuments({ companyId: company._id });

            return {
                ...company.toObject(),
                stats: {
                    users: userCount,
                    tickets: ticketCount
                }
            };
        }));

        res.json({
            success: true,
            companies: companiesWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            message: 'Error fetching companies',
            error: error.message
        });
    }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
export const getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Get statistics
        const userCount = await User.countDocuments({ companyId: company._id });
        const ticketCount = await Ticket.countDocuments({ companyId: company._id });
        const openTickets = await Ticket.countDocuments({ companyId: company._id, status: 'Open' });

        res.json({
            success: true,
            company: {
                ...company.toObject(),
                stats: {
                    users: userCount,
                    tickets: ticketCount,
                    openTickets
                }
            }
        });
    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            message: 'Error fetching company',
            error: error.message
        });
    }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (Super Admin)
export const createCompany = async (req, res) => {
    try {
        const { name, domain, logo, primaryColor, settings, subscription, metadata } = req.body;

        // Check if company with same name exists
        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company with this name already exists' });
        }

        const company = await Company.create({
            name,
            domain,
            logo,
            primaryColor,
            settings,
            subscription,
            metadata
        });

        res.status(201).json({
            success: true,
            company
        });
    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            message: 'Error creating company',
            error: error.message
        });
    }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Super Admin or Company Admin)
export const updateCompany = async (req, res) => {
    try {
        const { name, domain, logo, primaryColor, settings, subscription, metadata, isActive } = req.body;

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Update fields
        if (name) company.name = name;
        if (domain !== undefined) company.domain = domain;
        if (logo !== undefined) company.logo = logo;
        if (primaryColor) company.primaryColor = primaryColor;
        if (settings) company.settings = { ...company.settings, ...settings };
        if (subscription) company.subscription = { ...company.subscription, ...subscription };
        if (metadata) company.metadata = { ...company.metadata, ...metadata };
        if (isActive !== undefined) company.isActive = isActive;

        await company.save();

        res.json({
            success: true,
            company
        });
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            message: 'Error updating company',
            error: error.message
        });
    }
};

// @desc    Delete company (soft delete)
// @route   DELETE /api/companies/:id
// @access  Private (Super Admin)
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Soft delete
        company.isActive = false;
        await company.save();

        res.json({
            success: true,
            message: 'Company deactivated successfully'
        });
    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            message: 'Error deleting company',
            error: error.message
        });
    }
};

// @desc    Get company relationships
// @route   GET /api/companies/:id/relationships
// @access  Private
export const getCompanyRelationships = async (req, res) => {
    try {
        const companyId = req.params.id;

        // Get relationships where company is provider or client
        const relationships = await CompanyRelationship.find({
            $or: [
                { providerCompany: companyId },
                { clientCompany: companyId }
            ],
            isActive: true
        })
            .populate('providerCompany', 'name logo')
            .populate('clientCompany', 'name logo')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            relationships
        });
    } catch (error) {
        console.error('Get relationships error:', error);
        res.status(500).json({
            message: 'Error fetching relationships',
            error: error.message
        });
    }
};

// @desc    Create company relationship
// @route   POST /api/companies/relationships
// @access  Private (Super Admin or Company Admin)
export const createRelationship = async (req, res) => {
    try {
        const { providerCompany, clientCompany, relationshipType, slaAgreement, notes } = req.body;

        // Check if relationship already exists
        const existing = await CompanyRelationship.findOne({
            providerCompany,
            clientCompany
        });

        if (existing) {
            return res.status(400).json({ message: 'Relationship already exists' });
        }

        const relationship = await CompanyRelationship.create({
            providerCompany,
            clientCompany,
            relationshipType,
            slaAgreement,
            notes
        });

        await relationship.populate('providerCompany clientCompany', 'name logo');

        res.status(201).json({
            success: true,
            relationship
        });
    } catch (error) {
        console.error('Create relationship error:', error);
        res.status(500).json({
            message: 'Error creating relationship',
            error: error.message
        });
    }
};

// @desc    Update company relationship
// @route   PUT /api/companies/relationships/:id
// @access  Private (Super Admin or Company Admin)
export const updateRelationship = async (req, res) => {
    try {
        const { relationshipType, slaAgreement, isActive, notes } = req.body;

        const relationship = await CompanyRelationship.findById(req.params.id);

        if (!relationship) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        if (relationshipType) relationship.relationshipType = relationshipType;
        if (slaAgreement) relationship.slaAgreement = { ...relationship.slaAgreement, ...slaAgreement };
        if (isActive !== undefined) relationship.isActive = isActive;
        if (notes !== undefined) relationship.notes = notes;

        await relationship.save();
        await relationship.populate('providerCompany clientCompany', 'name logo');

        res.json({
            success: true,
            relationship
        });
    } catch (error) {
        console.error('Update relationship error:', error);
        res.status(500).json({
            message: 'Error updating relationship',
            error: error.message
        });
    }
};
